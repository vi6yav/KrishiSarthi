from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.schemas import UserSignup, UserLogin, Token, UserOut
from app.services.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/signup", response_model=Token)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email})
    return Token(access_token=token, token_type="bearer", user=new_user)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": user.email})
    return Token(access_token=token, token_type="bearer", user=user)