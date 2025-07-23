from fitbro_backend.database import SessionLocal
from fitbro_backend.models.user import User, RoleEnum

db = SessionLocal()

test_users = [
    {"mobile": "9999990001", "name": "FitBro Admin 1", "role": RoleEnum.FITBRO_ADMIN, "password": "123456"},
    {"mobile": "9999990002", "name": "FitBro Admin 2", "role": RoleEnum.FITBRO_ADMIN, "password": "123456"},
    {"mobile": "9999990101", "name": "FitBro Officer 1", "role": RoleEnum.FITBRO_OFFICER, "password": "123456"},
    {"mobile": "9999990102", "name": "FitBro Officer 2", "role": RoleEnum.FITBRO_OFFICER, "password": "123456"},
    {"mobile": "9999990201", "name": "Gym Owner 1", "role": RoleEnum.GYM_OWNER, "password": "123456"},
    {"mobile": "9999990202", "name": "Gym Owner 2", "role": RoleEnum.GYM_OWNER, "password": "123456"},
    {"mobile": "9999990301", "name": "Gym Instructor 1", "role": RoleEnum.GYM_INSTRUCTOR, "password": "123456"},
    {"mobile": "9999990302", "name": "Gym Instructor 2", "role": RoleEnum.GYM_INSTRUCTOR, "password": "123456"},
    {"mobile": "9999990401", "name": "Gym Officer 1", "role": RoleEnum.GYM_OFFICER, "password": "123456"},
    {"mobile": "9999990402", "name": "Gym Officer 2", "role": RoleEnum.GYM_OFFICER, "password": "123456"},
    {"mobile": "9999990501", "name": "Member 1", "role": RoleEnum.GYM_MEMBER, "password": "123456"},
    {"mobile": "9999990502", "name": "Member 2", "role": RoleEnum.GYM_MEMBER, "password": "123456"},
    {"mobile": "9999990503", "name": "Member 3", "role": RoleEnum.GYM_MEMBER, "password": "123456"},
    {"mobile": "9999990504", "name": "Member 4", "role": RoleEnum.GYM_MEMBER, "password": "123456"},
    {"mobile": "9999990505", "name": "Member 5", "role": RoleEnum.GYM_MEMBER, "password": "123456"},
]

for user_data in test_users:
    # Only add if not already present
    exists = db.query(User).filter_by(mobile=user_data["mobile"]).first()
    if not exists:
        user = User(**user_data)
        db.add(user)

db.commit()
db.close()
print("Test users added.")
