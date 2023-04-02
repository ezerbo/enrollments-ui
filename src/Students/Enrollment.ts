import {Course} from "../Courses/Course";

export interface Enrollment {
    course: Course;
    enrollmentDate: Date;
    gradeId: number;
}