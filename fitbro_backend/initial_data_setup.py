from sqlalchemy.orm import Session
from fitbro_backend.database import SessionLocal, engine
from fitbro_backend.models import (
    User, RoleEnum, Gym, Program, Workout, Exercise, Equipment,
    MembershipPlan, Member, CyclePlan, AssessmentTemplate,
    WorkoutPlanEntry, WorkoutLog, AssessmentResult
)
from datetime import date, timedelta

db: Session = SessionLocal()

# USERS
users = [
    User(mobile="9999990001", name="FitBro Admin", role=RoleEnum.admin),
    User(mobile="9999990002", name="FitBro Officer", role=RoleEnum.officer),
    User(mobile="8888881001", name="XYZ Gym Owner", role=RoleEnum.gym_owner),
    User(mobile="8888881002", name="XYZ Gym Instructor", role=RoleEnum.instructor),
    User(mobile="8888881003", name="ABC Gym Owner", role=RoleEnum.gym_owner),
    User(mobile="8888881004", name="ABC Gym Instructor", role=RoleEnum.instructor),
]

# GYMS
gyms = [
    Gym(name="XYZ Gym", address="Bangalore", owner_mobile="8888881001", contract_start=date.today(), contract_end=date.today() + timedelta(days=3*365)),
    Gym(name="ABC Gym", address="Chennai", owner_mobile="8888881003", contract_start=date.today(), contract_end=date.today() + timedelta(days=2*365)),
]

# EQUIPMENT
equipments = [
    Equipment(name="Treadmill", gym_id=1, manufacturer="LifeFitness", purchase_date=date(2024, 2, 1), warranty_years=2, status="active"),
    Equipment(name="Bench Press", gym_id=1, manufacturer="Impulse", purchase_date=date(2024, 1, 1), warranty_years=3, status="active"),
    Equipment(name="Elliptical", gym_id=2, manufacturer="Technogym", purchase_date=date(2023, 12, 15), warranty_years=2, status="active"),
]

# PROGRAMS
programs = [
    Program(name="Strength & Conditioning", description="Build muscle, increase strength", is_master=True),
    Program(name="Cardio Blast", description="Improve heart health", is_master=True),
    Program(name="Strength - Custom", description="Custom version for XYZ Gym", gym_id=1, parent_id=1),
]

# WORKOUTS
workouts = [
    Workout(name="Upper Body", program_id=1, gym_id=None),
    Workout(name="Lower Body", program_id=1, gym_id=None),
    Workout(name="HIIT", program_id=2, gym_id=None),
    Workout(name="Chest Day", program_id=3, gym_id=1),
]

# EXERCISES
exercises = [
    Exercise(name="Incline Dumbbell Press", primary_muscle="Chest", secondary_muscle="Triceps", equipment_id=2, is_master=True),
    Exercise(name="Squats", primary_muscle="Legs", equipment_id=None, is_master=True),
    Exercise(name="Chest Press Machine", primary_muscle="Chest", equipment_id=2, is_master=True),
    Exercise(name="Burpees", primary_muscle="Full Body", is_master=True),
    Exercise(name="Push Ups", primary_muscle="Chest", is_master=True),
]

# MEMBERSHIP PLANS
plans = [
    MembershipPlan(name="Cardio Only", gym_id=1, programs=[2], duration="3 Months", price=10000, status="active"),
    MembershipPlan(name="Strength + Cardio", gym_id=1, programs=[1,2], duration="6 Months", price=16000, status="active"),
    MembershipPlan(name="HIIT Premium", gym_id=2, programs=[3], duration="3 Months", price=12000, status="active"),
]

# MEMBERS
members = [
    Member(name="Amit Singh", mobile="9000000001", gym_id=1, membership_plan_id=1),
    Member(name="Priya Rao", mobile="9000000002", gym_id=1, membership_plan_id=2),
    Member(name="Rahul Jain", mobile="9000000003", gym_id=2, membership_plan_id=3),
]

# CYCLES
cycles = [
    CyclePlan(member_id=1, cycle_number=1, start_date=date.today(), end_date=date.today()+timedelta(days=28), status="Active"),
    CyclePlan(member_id=2, cycle_number=1, start_date=date.today(), end_date=date.today()+timedelta(days=28), status="Active"),
]

# ASSESSMENT TEMPLATES
templates = [
    AssessmentTemplate(name="Initial Fitness Assessment", attributes="Height,Weight,Flexibility,Muscle Mass"),
    AssessmentTemplate(name="Progress Check", attributes="Weight,BMI,Strength,Flexibility"),
]

# WORKOUT PLAN ENTRIES
wpe = [
    WorkoutPlanEntry(cycle_plan_id=1, day_number=1, workout_id=1, exercise_id=1, planned_sets=3, planned_reps=12),
    WorkoutPlanEntry(cycle_plan_id=1, day_number=2, workout_id=2, exercise_id=2, planned_sets=4, planned_reps=10),
]

# WORKOUT LOGS
wlogs = [
    WorkoutLog(member_id=1, cycle_plan_id=1, day_number=1, exercise_id=1, sets_completed=3, reps_completed=12, status="Completed", log_date=date.today()),
    WorkoutLog(member_id=1, cycle_plan_id=1, day_number=2, exercise_id=2, sets_completed=4, reps_completed=10, status="Completed", log_date=date.today()),
]

# ASSESSMENT RESULTS
ares = [
    AssessmentResult(member_id=1, template_id=1, date_taken=date.today(), values="Height:172,Weight:80,Flexibility:Moderate,Muscle Mass:Above Avg"),
]

# Insert all into DB
for obj_list in [users, gyms, equipments, programs, workouts, exercises, plans, members, cycles, templates, wpe, wlogs, ares]:
    for obj in obj_list:
        db.add(obj)
db.commit()
db.close()
print("DB seeded with initial data!")
