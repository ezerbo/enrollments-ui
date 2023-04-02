import React from "react";
import {
    Dialog,
    DialogType,
    Dropdown,
    IDropdownOption,
    MessageBarType,
    PrimaryButton,
    Separator,
    Spinner
} from "@fluentui/react";
import {Message} from "../../../commons/Message/Message";
import {ENROLLMENTS_API_URL} from "../../../index";
import axios from "axios";
import {Enrollment} from "../../Enrollment";

interface DialogProps {
    studentId: number;
    show: boolean;
    courses: IDropdownOption[];
    onDismiss: () => void;
    onEnroll: (e: Enrollment) => void;
}

interface DialogState {
    courseId?: number;
    enrolling: boolean;
    errorMessage?: string;
}

const dropdownStyles = {dropdown: {width: 450}};

export class EnrollmentDialog extends React.Component<DialogProps, DialogState> {

    constructor(props: DialogProps) {
        super(props);
        this.state = {enrolling: false};
    }

    render() {
        const {courses} = this.props;
        const {enrolling, courseId, errorMessage} = this.state;
        return (
            <Dialog
                hidden={!this.props.show}
                onDismiss={this.dismissDialog}
                dialogContentProps={{
                    type: DialogType.close,
                    title: 'Enrolling a Student',
                    closeButtonAriaLabel: 'Close',
                }}
                modalProps={{
                    isBlocking: true
                }}
                minWidth={500}
            >
                {
                    enrolling && <Spinner label="Enrolling..."/>
                }
                {
                    errorMessage && <Message message={errorMessage} type={MessageBarType.error} />
                }
                {
                    courses ? (
                        <div>
                            {
                                !courses.length && (
                                    <div style={{paddingBottom: 10}}>
                                        <Message
                                            message="Student is enrolled into all available courses"
                                            type={MessageBarType.info}
                                        />
                                    </div>
                                )
                            }
                            <Dropdown
                                placeholder="Select a course"
                                label="Course"
                                options={courses}
                                required
                                styles={dropdownStyles}
                                onChange={this.onCourseSelection}
                            />
                            <Separator/>
                            <div style={{paddingTop: 10}}>
                                <PrimaryButton
                                    text="Enroll"
                                    iconProps={{iconName: 'AddToShoppingList'}}
                                    onClick={this.enroll}
                                    disabled={!courseId}
                                />
                            </div>
                        </div>
                    ) : (
                        <Spinner label="Getting courses..."/>
                    )
                }
            </Dialog>
        );
    }

    private enroll = () => {
        this.setState({enrolling: true});
        axios({
            url: `${ENROLLMENTS_API_URL}/courses/${this.state.courseId}/enrollments`,
            method: 'POST',
            data: JSON.stringify({studentId: this.props.studentId}),
            headers: {'Content-Type': 'application/json'}
        })
            .then((res) => {
                this.setState({
                    enrolling: false
                });
                this.props.onEnroll(res.data);
            }).catch(error => {
            this.setState({enrolling: false, errorMessage: error.response.data.message});
            console.log(error.response.data);
        });
    }

    private onCourseSelection = (event, option) => {
        this.setState({courseId: option.key});
    }

    private dismissDialog = () => {
        this.dismissMessage();
        this.props.onDismiss();
    }

    private dismissMessage = () => {
        this.setState({errorMessage: undefined});
    }

}