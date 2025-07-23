from .auth import router as auth_router
from .user import router as user_router
from .gym import router as gym_router
from .program import router as program_router
from .workout import router as workout_router
from .exercise import router as exercise_router
from .equipment import router as equipment_router
from .membership_plan import router as membership_plan_router
from .member import router as member_router
from .cycle_plan import router as cycle_plan_router
from .assessment_template import router as assessment_template_router
from .assessment_result import router as assessment_result_router
from .workout_plan_entry import router as workout_plan_entry_router
from .workout_log import router as workout_log_router
from .announcement import router as announcement_router
from .auth import router as auth_router
from .visitor_followup import router as visitor_followup_router
from .visitor import router as visitor_router


all_routers = [
    auth_router,
    user_router,
    gym_router,
    program_router,
    workout_router,
    exercise_router,
    equipment_router,
    membership_plan_router,
    member_router,
    cycle_plan_router,
    assessment_template_router,
    assessment_result_router,
    workout_plan_entry_router,
    workout_log_router,
    announcement_router,
    auth_router,
    visitor_router,
    visitor_followup_router,
]
