import React from "react";
import axios from "axios";
import {handleErrors, toDate} from "../commons/http.util";
import {ENROLLMENTS_API_URL} from "../index";
import {Student} from "./Student";
import {
    DetailsListLayoutMode,
    IColumn,
    SelectionMode,
    Selection,
    Separator,
    MessageBarType,
    ShimmeredDetailsList,
    Icon,
    PrimaryButton
} from "@fluentui/react";

import {TableControl} from "../TableControl/TableControl";
import {StudentDialog} from "./StudentDialog/StudentDialog";
import {Enrollment} from "./Enrollment";
import {separatorIconStyles} from "../commons/styles.util";
import {EnrollmentsDialog} from "./EnrollmentsDialog/EnrollmentsDialog";
import {Message} from "../commons/Message/Message";

interface StudentsState {
    students: Student[];
    enrollments?: Enrollment[];
    selected?: Student;
    showDialog: boolean;
    showEnrollmentsDialog?: boolean;
    message?: string;
    gettingStudents: boolean;
    gettingEnrollments?: boolean;
    editing?: boolean;
}

interface StudentsProps {
    onCountChange: (count: number) => void
}

export class Students extends React.Component<StudentsProps, StudentsState> {

    private timeoutID = null;
    private readonly selection: Selection;

    constructor(props: StudentsProps) {
        super(props);
        this.state = {students: [], showDialog: false, gettingStudents: false, showEnrollmentsDialog: false};
        this.selection = new Selection({
            onSelectionChanged: () => {
                let selections = this.selection.getSelection();
                let selected = selections.length ? selections[0] as Student : null;
                this.setState({
                    selected: selected
                });
            }
        });
    }

    componentDidMount() {
        this.getAll();
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutID);
    }

    render() {
        const {
            students,
            selected,
            showDialog,
            editing,
            message,
            enrollments,
            gettingStudents,
            showEnrollmentsDialog,
        } = this.state;
        return (
            <div style={{paddingLeft: 10}}>
                {
                    message && (
                        <Message
                            message={message}
                            type={MessageBarType.success}
                        />
                    )
                }
                <Separator>
                    <Icon iconName="People" styles={separatorIconStyles}/>
                </Separator>
                <div style={{paddingTop: 10}}>
                    <TableControl
                        selection={selected}
                        disabledUntilSelection={selected === undefined}
                        onAddClick={() => this.showDialog(false)}
                        onEditClick={() => this.showDialog(true)}
                        onDeleteClick={this.toggleConfirmationDialog}
                    />
                </div>
                <ShimmeredDetailsList
                    items={students || []}
                    enableShimmer={gettingStudents}
                    columns={this.columns}
                    selectionMode={SelectionMode.single}
                    setKey="students"
                    layoutMode={DetailsListLayoutMode.justified}
                    selection={this.selection}
                    selectionPreservedOnEmptyClick={true}
                />
                {
                    selected && (
                        <div style={{paddingTop: 10, paddingBottom: 10}}>
                            <PrimaryButton
                                text="Enrollments"
                                iconProps={{iconName: 'Education'}}
                                onClick={this.toggleEnrollmentsDialog}
                            />
                        </div>
                    )
                }
                <StudentDialog
                    show={showDialog}
                    student={editing ? selected : undefined}
                    onCreateSuccess={this.onCreate}
                    onEditSuccess={this.onEdit}
                    onDismiss={this.dismissDialog}
                />
                {
                    selected && (
                        <div>
                            <EnrollmentsDialog
                                student={selected}
                                enrollments={enrollments}
                                show={showEnrollmentsDialog}
                                onDismiss={this.toggleEnrollmentsDialog}
                                onEnroll={this.onEnroll}
                                onUnenroll={this.onUnenroll}
                            />
                        </div>
                    )
                }
            </div>
        );
    }

    private getAll = () => {
        this.setState({gettingStudents: true})
        axios({
            url: `${ENROLLMENTS_API_URL}/students`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        })
            .then(res => handleErrors(res))
            .then(res => {
                this.setState(() => {
                    return {students: res.data, gettingStudents: false};
                });
                this.props.onCountChange(res.data.length)
            }).catch(error => {
            console.log(JSON.stringify(error));
            this.setState({
                gettingStudents: false
            });
        });
    }

    private getEnrollments = (studentId: number) => {
        this.setState({enrollments: undefined});
        axios({
            url: `${ENROLLMENTS_API_URL}/students/${studentId}/enrollments`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        })
            .then(res => handleErrors(res))
            .then(res => {
                this.setState(() => {
                    return {enrollments: res.data.enrollments};
                });
            }).catch(error => {
            console.log(JSON.stringify(error));
        });
    }

    private showDialog = (editing: boolean) => {
        this.setState({showDialog: true, editing: editing});
    }

    private dismissDialog = () => {
        this.setState({showDialog: false});
    }

    private toggleConfirmationDialog = () => {

    }

    private toggleEnrollmentsDialog = () => {
        if (!this.state.showEnrollmentsDialog) { // State is changing from 'hidden' to 'shown'
            this.getEnrollments(this.state.selected.id);
        }
        this.setState((state) => ({showEnrollmentsDialog: !state.showEnrollmentsDialog}));
    }

    private onEnroll = (e: Enrollment) => {
        this.setState(state => {
                let enrollments = state.enrollments;
                enrollments.push(e);
                return {
                    enrollments: enrollments
                }
            }
        );
        this.resetMessage();
    }

    private onUnenroll = (enrollment: Enrollment) => {
        this.setState(state => {
                let enrollments = state.enrollments
                    .filter(e => e.gradeId !== enrollment.gradeId)
                    .slice();
                return {
                    enrollments: enrollments
                }
            }
        );
        this.resetMessage();
    }

    private onCreate = (student: Student) => {
        this.setState((state) => {
            let {students} = state;
            students.push(student);
            this.props.onCountChange(students.length);
            return {
                message: 'Student Created Successfully',
                students: students.slice()
            };
        });
        this.resetMessage();
    }

    private onEdit = (student: Student) => {
        this.setState((state) => {
            let {students} = state;
            let index = students.findIndex(c => c.id === student.id);
            students[index] = student;
            return {
                students: students.slice(),
                selected: student,
                message: 'Student Updated Successfully'
            };
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
            key: 'firstname',
            name: 'First name',
            ariaLabel: 'First Name',
            fieldName: 'firstName',
            minWidth: 200,
            maxWidth: 300,
        },
        {
            key: 'lastName',
            name: 'Last name',
            ariaLabel: 'Last Name',
            fieldName: 'lastName',
            minWidth: 200,
            maxWidth: 300,
        },
        {
            key: 'emailAddress',
            name: 'Email Address',
            ariaLabel: 'Email Address',
            fieldName: 'emailAddress',
            minWidth: 200,
            maxWidth: 300,
        },
        {
            key: 'ssn',
            name: 'SSN',
            ariaLabel: 'SSN',
            fieldName: 'ssn',
            minWidth: 200,
            maxWidth: 300,
        },
        {
            key: 'dob',
            name: 'Date of Birth',
            ariaLabel: 'Date of Birth',
            fieldName: 'dob',
            minWidth: 200,
            maxWidth: 300,
            onRender: (student: Student) => {
                return <span>{toDate(student.dob)}</span>;
            },
        }
    ];
}