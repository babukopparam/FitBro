import os
from datetime import date, timedelta
from fitbro_backend.database import Base, engine, SessionLocal
from fitbro_backend.models import (
    User, RoleEnum, Gym, Program, Workout, Exercise, Equipment,
    MembershipPlan, Member, CyclePlan, AssessmentTemplate,
    WorkoutPlanEntry, WorkoutLog, AssessmentResult
)

print("\n----- DROPPING ALL TABLES -----")
Base.metadata.drop_all(bind=engine)
print("All tables dropped.\n")

print("----- CREATING ALL TABLES -----")
Base.metadata.create_all(bind=engine)
print("All tables created.\n")

db = SessionLocal()

# ---- Seed Users ----
users = [
    User(mobile="9999990001", name="FitBro Admin", password="123456", role=RoleEnum.FITBRO_ADMIN),
    User(mobile="9999990002", name="FitBro Officer", password="123456", role=RoleEnum.FITBRO_OFFICER),
    User(mobile="8888881001", name="XYZ Gym Owner", password="123456", role=RoleEnum.GYM_OWNER),
    User(mobile="8888881002", name="XYZ Gym Instructor", password="123456", role=RoleEnum.GYM_INSTRUCTOR),
    User(mobile="8888881003", name="ABC Gym Owner", password="123456", role=RoleEnum.GYM_OWNER),
    User(mobile="8888881004", name="ABC Gym Instructor", password="123456", role=RoleEnum.GYM_INSTRUCTOR),
]
for u in users: db.add(u)

# ---- Seed Gyms ----
gyms = [
    Gym(
        name="XYZ Gym", address="Bangalore", owner_mobile="8888881001",
        contract_start=date.today(),
        contract_end=date.today() + timedelta(days=3*365),
        owner_name="XYZ Gym Owner", owner_email="xyz-owner@email.com",
        recurring_revenue_start=date.today()
    ),
    Gym(
        name="ABC Gym", address="Chennai", owner_mobile="8888881003",
        contract_start=date.today(),
        contract_end=date.today() + timedelta(days=2*365),
        owner_name="ABC Gym Owner", owner_email="abc-owner@email.com",
        recurring_revenue_start=date.today()
    ),
]
for g in gyms: db.add(g)

db.commit()  # Ensure gyms have IDs

# ---- Seed Equipment ----
equipments = [
    Equipment(name="Treadmill", gym_id=1, manufacturer="LifeFitness", purchase_date=date(2024, 2, 1), warranty_years=2, status="active"),
    Equipment(name="Bench Press", gym_id=1, manufacturer="Impulse", purchase_date=date(2024, 1, 1), warranty_years=3, status="active"),
    Equipment(name="Elliptical", gym_id=2, manufacturer="Technogym", purchase_date=date(2023, 12, 15), warranty_years=2, status="active"),
]
for eq in equipments: db.add(eq)

# ---- Seed Programs ----
programs = [
    Program(name="Strength & Conditioning", description="Build muscle, increase strength", is_master=True),
    Program(name="Cardio Blast", description="Improve heart health", is_master=True),
    Program(name="Strength - Custom", description="Custom version for XYZ Gym", gym_id=1, parent_id=1),
]
for p in programs: db.add(p)

db.commit()  # Ensure programs have IDs

# ---- Seed Workouts ----
workouts = [
    Workout(name="Upper Body", program_id=1, gym_id=None),
    Workout(name="Lower Body", program_id=1, gym_id=None),
    Workout(name="HIIT", program_id=2, gym_id=None),
    Workout(name="Chest Day", program_id=3, gym_id=1),
]
for w in workouts: db.add(w)

db.commit()  # Ensure workouts have IDs

# ---- Seed Exercises ----
exercises = [
    Exercise(name="Incline Dumbbell Press", primary_muscle="Chest", secondary_muscle="Triceps", equipment_id=2, is_master=True),
    Exercise(name="Squats", primary_muscle="Legs", equipment_id=None, is_master=True),
    Exercise(name="Chest Press Machine", primary_muscle="Chest", equipment_id=2, is_master=True),
    Exercise(name="Burpees", primary_muscle="Full Body", is_master=True),
    Exercise(name="Push Ups", primary_muscle="Chest", is_master=True),
]
for e in exercises: db.add(e)

db.commit()  # Ensure exercises have IDs

# ---- Seed Membership Plans ----
plans = [
    MembershipPlan(name="Cardio Only", gym_id=1, duration="3 Months", price=10000, status="active"),
    MembershipPlan(name="Strength + Cardio", gym_id=1, duration="6 Months", price=16000, status="active"),
    MembershipPlan(name="HIIT Premium", gym_id=2, duration="3 Months", price=12000, status="active"),
]
for plan in plans: db.add(plan)

db.commit()  # Ensure plans have IDs

# ---- Seed Members (with all required fields!) ----
members = [
    Member(
        name="Amit Singh", mobile="9000000001", email="amit@example.com", photo_url="url1",
        dob=date(2000,1,1), gender="Male", address="Bangalore", join_date=date.today(),
        gym_id=1, membership_plan_id=1, active=True
    ),
    Member(
        name="Priya Rao", mobile="9000000002", email="priya@example.com", photo_url="url2",
        dob=date(2002,5,10), gender="Female", address="Bangalore", join_date=date.today(),
        gym_id=1, membership_plan_id=2, active=True
    ),
    Member(
        name="Rahul Jain", mobile="9000000003", email="rahul@example.com", photo_url="url3",
        dob=date(1998,7,15), gender="Male", address="Chennai", join_date=date.today(),
        gym_id=2, membership_plan_id=3, active=True
    ),
]
for m in members: db.add(m)

db.commit()  # Ensure members have IDs

# ---- Seed Cycles ----
cycles = [
    CyclePlan(member_id=1, cycle_number=1, start_date=date.today(), end_date=date.today()+timedelta(days=28), status="Active"),
    CyclePlan(member_id=2, cycle_number=1, start_date=date.today(), end_date=date.today()+timedelta(days=28), status="Active"),
]
for c in cycles: db.add(c)

db.commit()

# ---- Seed Assessment Templates ----
templates = [
    AssessmentTemplate(name="Initial Fitness Assessment", attributes="Height,Weight,Flexibility,Muscle Mass"),
    AssessmentTemplate(name="Progress Check", attributes="Weight,BMI,Strength,Flexibility"),
]
for t in templates: db.add(t)

db.commit()

# ---- Seed WorkoutPlanEntry ----
wpe = [
    WorkoutPlanEntry(cycle_plan_id=1, day_number=1, workout_id=1, exercise_id=1, planned_sets=3, planned_reps=12),
    WorkoutPlanEntry(cycle_plan_id=1, day_number=2, workout_id=2, exercise_id=2, planned_sets=4, planned_reps=10),
]
for entry in wpe: db.add(entry)

db.commit()

# ---- Seed WorkoutLog ----
wlogs = [
    WorkoutLog(member_id=1, cycle_plan_id=1, day_number=1, exercise_id=1, sets_completed=3, reps_completed=12, status="Completed", log_date=date.today()),
    WorkoutLog(member_id=1, cycle_plan_id=1, day_number=2, exercise_id=2, sets_completed=4, reps_completed=10, status="Completed", log_date=date.today()),
]
for wl in wlogs: db.add(wl)

db.commit()

# ---- Seed Assessment Results ----
ares = [
    AssessmentResult(member_id=1, template_id=1, date_taken=date.today(), values="Height:172,Weight:80,Flexibility:Moderate,Muscle Mass:Above Avg"),
]
for ar in ares: db.add(ar)

db.commit()
db.close()

print("\n---- DB reset and seeded with initial data! ----")
