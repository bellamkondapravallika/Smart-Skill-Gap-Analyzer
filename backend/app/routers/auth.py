import logging
import secrets
from urllib.parse import urlencode

import httpx
from authlib.integrations.base_client.errors import OAuthError
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import (
    SignupRequest, LoginRequest, AuthResponse, UserResponse,
    OAuthStatusResponse
)
from ..utils.security import (
    verify_password, get_password_hash, create_access_token, get_current_user
)
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


class OAuthProviderError(Exception):
    pass


def _oauth_provider_config(provider: str) -> tuple[str, str, str]:
    if provider == "google":
        client_id = settings.GOOGLE_CLIENT_ID
        client_secret = settings.GOOGLE_CLIENT_SECRET
        authorization_url = "https://accounts.google.com/o/oauth2/v2/auth"
    elif provider == "github":
        client_id = settings.GITHUB_CLIENT_ID
        client_secret = settings.GITHUB_CLIENT_SECRET
        authorization_url = "https://github.com/login/oauth/authorize"
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OAuth provider not found.")

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{provider.title()} OAuth is not configured on the backend.",
        )

    callback_url = (
        f"{settings.BACKEND_URL.rstrip('/')}/api/auth/oauth/{provider}/callback"
    )
    return client_id, authorization_url, callback_url


async def _get_oauth_profile(
    provider: str,
    code: str,
    callback_url: str,
) -> tuple[str, str]:
    is_google = provider == "google"
    client_id = settings.GOOGLE_CLIENT_ID if is_google else settings.GITHUB_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET if is_google else settings.GITHUB_CLIENT_SECRET
    token_url = (
        "https://oauth2.googleapis.com/token"
        if is_google
        else "https://github.com/login/oauth/access_token"
    )
    scope = "openid email profile" if is_google else "read:user user:email"
    headers = {"Accept": "application/json"}
    if not is_google:
        headers["User-Agent"] = "Smart-Skill-Gap-Analyzer"

    try:
        async with AsyncOAuth2Client(
            client_id=client_id,
            client_secret=client_secret,
            scope=scope,
            redirect_uri=callback_url,
            token_endpoint_auth_method="client_secret_post",
            timeout=15,
        ) as oauth_client:
            token = await oauth_client.fetch_token(token_url, code=code)
            if not token.get("access_token"):
                raise OAuthProviderError("The identity provider did not return an access token.")

            profile_response = await oauth_client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo"
                if is_google
                else "https://api.github.com/user",
                headers=headers,
            )
            profile_response.raise_for_status()
            profile = profile_response.json()

            if is_google:
                if not isinstance(profile, dict) or profile.get("email_verified") is not True:
                    raise OAuthProviderError("A verified email address is required.")
                email = profile.get("email")
                full_name = profile.get("name")
            else:
                if not isinstance(profile, dict):
                    raise OAuthProviderError("The identity provider returned an invalid profile.")
                email_response = await oauth_client.get(
                    "https://api.github.com/user/emails",
                    headers=headers,
                )
                email_response.raise_for_status()
                email_records = email_response.json()
                if not isinstance(email_records, list):
                    raise OAuthProviderError("The identity provider did not return an email address.")
                verified_emails = [
                    record for record in email_records
                    if isinstance(record, dict) and record.get("verified") is True
                ]
                email_record = next(
                    (record for record in verified_emails if record.get("primary") is True),
                    verified_emails[0] if verified_emails else None,
                )
                if not email_record:
                    raise OAuthProviderError("A verified email address is required.")
                email = email_record.get("email")
                full_name = profile.get("name") or profile.get("login")
    except (OAuthError, httpx.HTTPError, ValueError) as exc:
        raise OAuthProviderError("The identity provider could not complete authentication.") from exc

    if not isinstance(email, str) or not email.strip():
        raise OAuthProviderError("The identity provider did not return an email address.")

    normalized_email = email.strip().lower()
    display_name = full_name.strip() if isinstance(full_name, str) else ""
    return normalized_email, display_name or normalized_email


def _oauth_failure_redirect(provider: str, reason: str = "oauth_failed") -> RedirectResponse:
    redirect = RedirectResponse(
        f"{settings.FRONTEND_URL.rstrip('/')}/login?{urlencode({'oauth_error': reason, 'provider': provider})}",
        status_code=status.HTTP_303_SEE_OTHER,
    )
    redirect.delete_cookie(
        key="skillgap_oauth_state",
        path=f"/api/auth/oauth/{provider}/callback",
    )
    return redirect

@router.post("/signup", response_model=AuthResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if data.confirm_password and data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check for existing user
    existing_user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    hashed_pw = get_password_hash(data.password)
    user = User(
        email=data.email.lower().strip(),
        full_name=data.full_name.strip(),
        hashed_password=hashed_pw,
        target_role="Frontend Developer",
        experience_level="1–2 years",
        goals=["Career growth", "Pass ATS filters", "Skill mastery"]
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if "full_name" in updates and updates["full_name"]:
        current_user.full_name = updates["full_name"].strip()
    if "target_role" in updates and updates["target_role"]:
        current_user.target_role = updates["target_role"].strip()
    if "experience_level" in updates:
        current_user.experience_level = updates["experience_level"]
    if "goals" in updates and isinstance(updates["goals"], list):
        current_user.goals = updates["goals"]
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/oauth/config", response_model=OAuthStatusResponse)
def get_oauth_configuration():
    """Reports whether OAuth providers have been configured on the backend."""
    return {
        "google_configured": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "github_configured": bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)
    }

@router.get("/oauth/{provider}")
def start_oauth(provider: str):
    try:
        client_id, authorization_url, callback_url = _oauth_provider_config(provider)
    except HTTPException as exc:
        if exc.status_code != status.HTTP_503_SERVICE_UNAVAILABLE:
            raise
        return _oauth_failure_redirect(provider, "not_configured")
    state = secrets.token_urlsafe(32)
    scopes = "openid email profile" if provider == "google" else "read:user user:email"
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": callback_url,
        "response_type": "code",
        "scope": scopes,
        "state": state,
    })
    redirect = RedirectResponse(
        f"{authorization_url}?{query}",
        status_code=status.HTTP_303_SEE_OTHER,
    )
    redirect.set_cookie(
        key="skillgap_oauth_state",
        value=state,
        httponly=True,
        secure=settings.BACKEND_URL.startswith("https://"),
        samesite="lax",
        max_age=600,
        path=f"/api/auth/oauth/{provider}/callback",
    )
    return redirect


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    oauth_state: str | None = Cookie(default=None, alias="skillgap_oauth_state"),
    db: Session = Depends(get_db),
):
    if provider not in {"google", "github"}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OAuth provider not found.")
    if not state or not oauth_state or not secrets.compare_digest(state, oauth_state):
        return _oauth_failure_redirect(provider)
    if error:
        return _oauth_failure_redirect(
            provider,
            "access_denied" if error == "access_denied" else "oauth_failed",
        )
    if not code:
        return _oauth_failure_redirect(provider)

    try:
        _, _, callback_url = _oauth_provider_config(provider)
        email, full_name = await _get_oauth_profile(provider, code, callback_url)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=None,
                oauth_provider=provider,
                target_role="Frontend Developer",
                experience_level="1–2 years",
                goals=["Career growth", "Pass ATS filters", "Skill mastery"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        token = create_access_token(data={"sub": str(user.id)})
    except OAuthProviderError:
        logger.exception("%s OAuth authentication failed", provider)
        return _oauth_failure_redirect(provider)
    except HTTPException as exc:
        if exc.status_code != status.HTTP_503_SERVICE_UNAVAILABLE:
            raise
        logger.warning("%s OAuth configuration is unavailable during callback", provider)
        return _oauth_failure_redirect(provider, "not_configured")
    except SQLAlchemyError:
        db.rollback()
        logger.exception("%s OAuth account could not be saved", provider)
        return _oauth_failure_redirect(provider)

    redirect = RedirectResponse(
        f"{settings.FRONTEND_URL.rstrip('/')}/login#access_token={token}&provider={provider}",
        status_code=status.HTTP_303_SEE_OTHER,
    )
    redirect.delete_cookie(
        key="skillgap_oauth_state",
        path=f"/api/auth/oauth/{provider}/callback",
    )
    return redirect
