import React from "react";
import {toDate} from "../../commons/http.util";
import {Enrollment} from "../Enrollment";
import {EnrollmentDialog} from "./EnrollmentDialog/EnrollmentDialog";
import {Student} from "../Student";
import axios from "axios";
import {ENROLLMENTS_API_URL, GRADES_API_URL} from "../../index";
import {Message} from "../../commons/Message/Message";
import {Confirmation} from "../../commons/Confirmation/Confirmation";
import {Grade} from "../Grade";
import {
    ActionButton,
    DetailsListLayoutMode,
    Dialog,
    DialogType, DirectionalHint,
    IColumn,
    IDropdownOption,
    MessageBarType,
    PrimaryButton,
    Selection,
    SelectionMode,
    Separator,
    ShimmeredDetailsList,
    Spinner, Text, TooltipHost
} from "@fluentui/react";
import {GradeDialog} from "../GradeDialog/GradeDialog";

interface EnrollmentsProps {
    student: Student;
    enrollments: Enrollment[];
    show: boolean;
    onDismiss: () => void;
    onEnroll: (e: Enrollment) => void;
    onUnenroll: (e: Enrollment) => void;
}

interface EnrollmentsState {
    selected?: Enrollment;
    courses?: IDropdownOption[]; // Courses a student can enroll into
    grade?: Grade;
    spinnerLabel?: string;
    showEnrollmentDialog?: boolean;
    showConfirmationDialog: boolean;
    showGradSubmissionDialog?: boolean;
    processing: boolean;
    message?: string;
    messageType?: MessageBarType;
}

const MISSING_GRADE = 'NOT_YET_SUBMITTED';

export class EnrollmentsDialog extends React.Component<EnrollmentsProps, EnrollmentsState> {

    private timeoutID = null;
    private readonly selection: Selection;

    constructor(props: EnrollmentsProps) {
        super(props);
        this.state = {showConfirmationDialog: false, processing: false};
        this.selection = new Selection({
            onSelectionChanged: () => {
                let selections = this.selection.getSelection();
                this.setState({
                    grade: null,
                    selected: selections.length ? selections[0] as Enrollment : null
                });
            }
        });
    }

    render() {
        const {student, enrollments} = this.props;
        const {
            selected,
            courses,
            grade,
            showEnrollmentDialog,
            showConfirmationDialog,
            showGradSubmissionDialog,
            spinnerLabel,
            processing,
            message,
            messageType
        } = this.state;
        return (
            <Dialog
                hidden={!this.props.show}
                onDismiss={this.dismissDialog}
                dialogContentProps={{
                    type: DialogType.close,
                    title: `Course Enrollments - ${student.lastName} ${student.firstName}`,
                    closeButtonAriaLabel: 'Close',
                    subText: 'Select a course and click on \'Grade\' to see the corresponding grade'
                }}
                modalProps={{
                    isBlocking: true
                }}
                minWidth={1000}
            >
                {
                    message && <Message message={message} type={messageType}/>
                }
                {
                    processing && <Spinner label={spinnerLabel}/>
                }
                {
                    grade && (
                        <div>
                            <Text>Grade: {grade.grade}</Text>
                            {
                                grade.grade === MISSING_GRADE ? (
                                    <TooltipHost
                                        content="Submit Grade"
                                        directionalHint={DirectionalHint.bottomCenter}
                                    >
                                        <ActionButton
                                            iconProps={{iconName: 'Send'}}
                                            style={{marginLeft: 10}}
                                            onClick={this.toggleGradeSubmissionDialog}
                                        />
                                    </TooltipHost>
                                ) : (
                                    <TooltipHost
                                        content="Edit Grade"
                                        directionalHint={DirectionalHint.bottomCenter}
                                    >
                                        <ActionButton
                                            iconProps={{iconName: 'Edit'}}
                                            style={{marginLeft: 10}}
                                            // onClick={this.toggleGradeSubmissionDialog}
                                        />
                                    </TooltipHost>
                                )
                            }
                        </div>
                    )
                }
                <ShimmeredDetailsList
                    items={enrollments || []}
                    enableShimmer={!enrollments}
                    columns={this.columns}
                    selectionMode={SelectionMode.single}
                    setKey="enrollments"
                    layoutMode={DetailsListLayoutMode.justified}
                    selection={this.selection}
                    selectionPreservedOnEmptyClick={true}
                />
                <Separator/>
                <div>
                    <PrimaryButton
                        text="Unenroll"
                        iconProps={{iconName: 'RemoveFromShoppingList'}}
                        style={{marginRight: 10}}
                        disabled={!selected || processing}
                        onClick={this.toggleConfirmationDialog}
                    />
                    <PrimaryButton
                        text="Enroll"
                        iconProps={{iconName: 'AddToShoppingList'}}
                        onClick={this.toggleEnrollmentDialog}
                        disabled={processing}
                    />
                    <PrimaryButton
                        text="Grade"
                        iconProps={{iconName: 'EntryView'}}
                        style={{float: 'right'}}
                        disabled={!selected || processing}
                        onClick={this.getGrades}
                    />
                </div>
                <EnrollmentDialog
                    studentId={this.props.student.id}
                    courses={courses}
                    show={showEnrollmentDialog}
                    onDismiss={this.toggleEnrollmentDialog}
                    onEnroll={this.onEnroll}
                />
                {
                    selected && (
                        <GradeDialog
                            show={showGradSubmissionDialog}
                            studentId={this.props.student.id}
                            courseId={selected.course.id}
                            grade={grade}
                            onDismiss={this.toggleGradeSubmissionDialog}
                            onSubmit={this.onGradeSubmission}
                        />
                    )
                }
                {
                    showConfirmationDialog && (
                        <Confirmation
                            question="Would you like to proceed with the unenrollment?"
                            confirmationBtnTxt="Unenroll"
                            onDismiss={this.toggleConfirmationDialog}
                            onConfirmation={this.unenroll}
                            width={500}
                            confirmationIconName='RemoveFromShoppingList'
                            style={{marginRight: '8px'}}
                        />
                    )
                }
            </Dialog>
        );
    }

    private unenroll = () => {
        const {student} = this.props;
        this.setState({processing: true, spinnerLabel: 'Unenrolling...'});
        axios({
            url: `${ENROLLMENTS_API_URL}/students/${student.id}/enrollments?courseId=${this.state.selected.course.id}`,
            method: 'DELETE',
            headers: {'Accept': 'application/json'}
        })
            .then(() => {
                this.setState({
                    message: `${student.lastName} ${student.firstName} successfully unenrolled from '${this.state.selected.course.name}'`,
                    messageType: MessageBarType.success,
                    processing: false,
                    showConfirmationDialog: false
                });
                this.props.onUnenroll(this.state.selected);
                this.resetMessage();
            }).catch(error => {
            this.setState({processing: false});
            console.log(JSON.stringify(error));
        });
    }

    private getCourses = (studentId: number) => {
        this.setState({courses: undefined});
        axios({
            url: `${ENROLLMENTS_API_URL}/courses?enrollingStudentId=${studentId}`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        })
            .then(res => {
                this.setState(() => {
                    return {courses: res.data.map(course => ({key: course.id.toString(), text: course.name}))};
                });
            }).catch(error => {
            console.log(JSON.stringify(error));
        });
    }

    private getGrades = () => {
        this.setState({processing: true, spinnerLabel: 'Getting grades...'});
        axios({
            url: `${GRADES_API_URL}/grades/${this.state.selected.gradeId}?tuitionId=${this.props.student.tuitionId}`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        })
            .then(res => {
                this.setState(() => {
                    return {grade: res.data, processing: false};
                });
            }).catch(error => {
            this.setState({
                processing: false,
                message: error.response.data.message,
                messageType: MessageBarType.error
            });
            console.log(JSON.stringify(error));
        });
    }

    private toggleConfirmationDialog = () => {
        this.setState((state) => ({
            showConfirmationDialog: !state.showConfirmationDialog
        }));
    }

    private toggleGradeSubmissionDialog = () => {
        this.setState((state) => ({
            showGradSubmissionDialog: !state.showGradSubmissionDialog
        }));
    }

    private toggleEnrollmentDialog = () => {
        if (!this.state.showEnrollmentDialog) { // State is changing from 'hidden' to 'shown'
            this.getCourses(this.props.student.id);
        }
        this.setState((state) => ({showEnrollmentDialog: !state.showEnrollmentDialog}));
    }

    private dismissDialog = () => {
        this.dismissMessage();
        this.setState({selected: null});
        this.props.onDismiss();
    }

    private dismissMessage = () => {
        this.setState({message: null});
    }

    private onEnroll = (e: Enrollment) => {
        this.setState({
            showEnrollmentDialog: false,
            message: 'Student successfully updated',
            messageType: MessageBarType.success
        });
        this.resetMessage();
        this.props.onEnroll(e);
    }

    private onGradeSubmission = (g: Grade) => {
        this.setState({
            grade: g,
            showGradSubmissionDialog: false,
            message: 'Grade successfully submitted',
            messageType: MessageBarType.success
        });
        this.resetMessage();
    }

    private resetMessage = () => {
        this.timeoutID = setTimeout(() => {
            this.setState({
                message: null
            })
        }, 5000);
    }

    columns: IColumn[] = [
        {
            key: 'name',
            name: 'Course',
            ariaLabel: 'Course',
            minWidth: 200,
            maxWidth: 300,
            onRender: (enrollment: Enrollment) => enrollment.course.name
        },
        {
            key: 'startDate',
            name: 'Start Date',
            ariaLabel: 'Start Date',
            minWidth: 200,
            maxWidth: 300,
            onRender: (enrollment: Enrollment) => toDate(enrollment.course.startDate)
        },
        {
            key: 'endDate',
            name: 'End Date',
            ariaLabel: 'End Date',
            minWidth: 200,
            maxWidth: 300,
            onRender: (enrollment: Enrollment) => toDate(enrollment.course.endDate)
        },
        {
            key: 'enrollmentDate',
            name: 'Enrollment Date',
            ariaLabel: 'Enrollment Date',
            minWidth: 200,
            maxWidth: 300,
            onRender: (enrollment: Enrollment) => toDate(enrollment.enrollmentDate)
        }
    ]
}