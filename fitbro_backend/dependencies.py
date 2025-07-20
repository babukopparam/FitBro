# fitbro_backend/dependencies.py

from fastapi import Depends, HTTPException
from .jwt_handler import get_current_user

# ===== TOGGLE THIS FOR DEV/PROD =====
ENABLE_ROLE_CHECKS = False  # Set to True in prod, False in dev

def require_roles(*roles):
    def role_checker(current_user=Depends(get_current_user)):
        if not ENABLE_ROLE_CHECKS:
            print("-------------------------------- dependencies.py ---- returning true")
            # Skip check in dev, allow all
            return True
        user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
        print(f"DEBUG: Current user role: {user_role}, Required roles: {roles}")
        if user_role not in roles:
            print("-------------------------------- dependencies.py ---- returning an exception that roles is not in expected roles ------")
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user
    return role_checker
