import React from "react";
import {
    Dialog,
    DialogType,
    Dropdown,
    MessageBarType,
    PrimaryButton,
    Separator,
    Spinner
} from "@fluentui/react";
import {Message} from "../../commons/Message/Message";
import {Grade} from "../Grade";
import axios from "axios";
import {GRADES_API_URL} from "../../index";

interface DialogProps {
    show: boolean;
    grade: Grade;
    studentId: number;
    courseId: number;
    onDismiss: () => void;
    onSubmit: (g: Grade) => void;
}

interface DialogState {
    selected?: string;
    submittingGrade: boolean;
    errorMessage?: string;
}

const dropdownStyles = {dropdown: {width: 450}};

export class GradeDialog extends React.Component<DialogProps, DialogState> {

    constructor(props: DialogProps) {
        super(props);
        this.state = {submittingGrade: false};
    }

    render() {
        const {selected, submittingGrade, errorMessage} = this.state;
        return (
            <Dialog
                hidden={!this.props.show}
                onDismiss={this.dismissDialog}
                dialogContentProps={{
                    type: DialogType.close,
                    title: 'Submitting Grade',
                    closeButtonAriaLabel: 'Close',
                }}
                modalProps={{
                    isBlocking: true
                }}
                minWidth={500}
            >
                {
                    submittingGrade && <Spinner label="Submitting Grade..."/>
                }
                {
                    errorMessage && <Message message={errorMessage} type={MessageBarType.error}/>
                }
                <div>
                    <Dropdown
                        placeholder="Select a grade"
                        label="Grade"
                        selectedKey={this.props.grade ? this.props.grade.grade : null}
                        options={[
                            {key: 'A', text: 'A'},
                            {key: 'B', text: 'B'},
                            {key: 'C', text: 'C'},
                            {key: 'D', text: 'D'},
                            {key: 'F', text: 'F'}
                        ]}
                        required
                        styles={dropdownStyles}
                        onChange={this.onGradeSelection}
                    />
                    <Separator/>
                    <div style={{paddingTop: 10}}>
                        <PrimaryButton
                            text="Submit"
                            iconProps={{iconName: 'Send'}}
                            onClick={this.submitGrade}
                            disabled={!selected}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }

    private submitGrade = () => {
        this.setState({submittingGrade: true});
        axios({
            url: `${GRADES_API_URL}/grades/${this.props.grade.id}`,
            method: 'PUT',
            data: JSON.stringify({
                studentId: this.props.studentId,
                courseId: this.props.courseId,
                grade: this.state.selected
            }),
            headers: {'Content-Type': 'application/json'}
        }).then((res) => {
            this.setState({ submittingGrade: false });
            this.props.onSubmit(res.data);
        }).catch(error => {
            this.setState({submittingGrade: false, errorMessage: error.response.data.message});
            console.log(error.response.data);
        });
    }

    private onGradeSelection = (event, option) => {
        this.setState({selected: option.key});
    }

    private dismissDialog = () => {
        this.dismissMessage();
        this.props.onDismiss();
    }

    private dismissMessage = () => {
        this.setState({errorMessage: undefined});
    }

}