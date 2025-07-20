# schemas/__init__.py - FIXED (Clean imports without duplicates)
from .user import UserCreate, UserRead, UserUpdate
from .gym import GymCreate, GymRead, GymUpdate, GymAssignOwner
from .equipment import EquipmentCreate, EquipmentRead, EquipmentUpdate, GymEquipmentCreate, GymEquipmentRead, GymEquipmentUpdate
from .exercise import ExerciseCreate, ExerciseRead, ExerciseUpdate
from .program import ProgramCreate, ProgramRead, ProgramUpdate
from .workout import WorkoutCreate, WorkoutRead, WorkoutUpdate
from .membership_plan import MembershipPlanCreate, MembershipPlanRead, MembershipPlanUpdate
from .member import MemberCreate, MemberRead, MemberUpdate
from .cycle_plan import CyclePlanCreate, CyclePlanRead, CyclePlanUpdate
from .assessment_template import AssessmentTemplateCreate, AssessmentTemplateRead, AssessmentTemplateUpdate
from .workout_plan_entry import WorkoutPlanEntryCreate, WorkoutPlanEntryRead, WorkoutPlanEntryUpdate
from .workout_log import WorkoutLogCreate, WorkoutLogRead, WorkoutLogUpdate
from .assessment_result import AssessmentResultCreate, AssessmentResultRead, AssessmentResultUpdate
from .announcement import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate
from .visitor import VisitorCreate, VisitorRead, VisitorUpdate
from .visitor_followup import VisitorFollowUpCreate, VisitorFollowUpRead, VisitorFollowUpUpdate