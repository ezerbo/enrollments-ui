import {Component} from "react";
import * as Yup from "yup";
import {Formik, Form, Field} from 'formik';
import {Student} from "../Student";
import {
    DefaultButton,
    DialogFooter,
    DialogType,
    Dialog,
    IStackProps,
    PrimaryButton,
    TextField,
    Stack,
    MessageBarType,
    MessageBar, Spinner, Separator
} from "@fluentui/react";
import axios from "axios";
import {handleHttpErrors} from "../../commons/http.util";
import {CustomDatePicker} from "../../commons/Custom/CustomDatePicker";
import {ENROLLMENTS_API_URL} from "../../index";
import {Tuition} from "../Tuition";

const Schema = Yup.object().shape({
    firstName: Yup.string()
        .min(3, 'Should be at least 3 characters long')
        .max(50, 'Should be at most 50 characters')
        .required('Please enter the first name'),
    lastName: Yup.string()
        .min(3,  'Should be at least 3 characters long')
        .max(50, 'Should be at most 50 characters')
        .required('Please enter the last name'),
    emailAddress: Yup.string()
        .email('Please enter a valid email address')
        .required('The email address is required'),
    ssn: Yup.string()
        .matches(new RegExp('[0-9]+'), 'Must be digits')
        .length(9, 'Must be 9 digits')
        .required('The SSN is required'),
    dob: Yup.date()
        .required('The date of birth is required'),
    tuitionAmount: Yup.number()
        .required('The tuition is required')
});

interface DialogProps {
    show: boolean;
    student: Student;
    onCreateSuccess: (student: Student) => void;
    onEditSuccess: (student: Student) => void;
    onDismiss: () => void;
}

interface DialogState {
    tuition?: Tuition
    processing: boolean
    gettingTuition: boolean
    errorMessage?: JSX.Element
}

export class StudentDialog extends Component<DialogProps, DialogState> {

    constructor(props: DialogProps) {
        super(props);
        this.state = {  processing: false, gettingTuition: false };
    }

    componentDidUpdate(prevProps: Readonly<DialogProps>, prevState: Readonly<DialogState>, snapshot?: any) {
        if (this.props.student && this.props.student !== prevProps.student) {
            this.getTuition(this.props.student.id);
        }
    }

    public render() {
        const columnProps: Partial<IStackProps> = {
            tokens: { childrenGap: 15 },
            styles: { root: { width: 550 } }
        };
        const { errorMessage, tuition, processing, gettingTuition } = this.state;
        const { student } = this.props;
        const title = student ? 'Edit Student' : 'Add Student';
        const subText = student ? 'Edit a student\'s info' : 'Add a new student';
        return (
            <Dialog
                hidden={!this.props.show}
                onDismiss={this.dismissDialog}
                dialogContentProps={{
                    type: DialogType.close,
                    title: title,
                    closeButtonAriaLabel: 'Close',
                    subText: subText,
                }}
                modalProps={{
                    titleAriaId: 'myLabelId',
                    subtitleAriaId: 'mySubTextId',
                    isBlocking: true,
                    containerClassName: 'ms-dialogMainOverride'
                }}
                minWidth={600}
            >
                {
                    errorMessage && (
                        <div>
                            {errorMessage}
                        </div>
                    )
                }

                {
                    processing && (
                        <div>
                            <Spinner label="Saving changes..." />
                        </div>
                    )
                }

                {
                    !gettingTuition ? (
                        <Formik
                            initialValues={student && tuition ?
                                {
                                    id: student.id,
                                    firstName: student.firstName,
                                    lastName: student.lastName,
                                    emailAddress: student.emailAddress,
                                    ssn: student.ssn,
                                    dob: new Date(student.dob),
                                    tuitionAmount: tuition.amount
                                } :
                                {
                                    id: undefined,
                                    firstName: '',
                                    lastName: '',
                                    emailAddress: '',
                                    ssn: '',
                                    dob: new Date(),
                                    tuitionAmount: 1000
                                }
                            }
                            validationSchema={Schema}
                            onSubmit={values => this.onSubmit(values as Student)}
                        >
                            {({ errors, touched, handleChange, handleBlur, values }) => (
                                <Form>
                                    <Stack horizontal tokens={{ childrenGap: 50 }} styles={{ root: { width: 550 } }}>
                                        <Stack {...columnProps}>
                                            <input type="hidden" value={values.id} />
                                            <TextField
                                                name="firstName"
                                                value={values.firstName}
                                                label="First Name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                iconProps={{ iconName: 'ContactInfo' }}
                                                errorMessage={errors.firstName && touched.firstName ? errors.firstName : undefined}
                                                required
                                            />
                                            <TextField
                                                name="lastName"
                                                value={values.lastName}
                                                label="Last Name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                iconProps={{ iconName: 'ContactInfo' }}
                                                errorMessage={errors.lastName && touched.lastName ? errors.lastName : undefined}
                                                required
                                            />
                                            <TextField
                                                name="emailAddress"
                                                value={values.emailAddress}
                                                label="Email Address"
                                                type="email"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                iconProps={{ iconName: 'Mail' }}
                                                errorMessage={errors.emailAddress && touched.emailAddress ? errors.emailAddress : undefined}
                                                required
                                            />
                                            <TextField
                                                name="ssn"
                                                value={values.ssn}
                                                label="SSN"
                                                maxLength={9}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                iconProps={{ iconName: 'ContactCard' }}
                                                errorMessage={errors.ssn && touched.ssn ? errors.ssn : undefined}
                                                required
                                            />
                                            <Field
                                                name="dob"
                                                label="Date of Birth"
                                                placeholder="Select the date of birth"
                                                component={CustomDatePicker}
                                            />
                                            <TextField
                                                name="tuitionAmount"
                                                prefix="$"
                                                min={1000}
                                                value={values.tuitionAmount.toString()}
                                                label="Tuition"
                                                type="number"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                iconProps={{ iconName: 'Money' }}
                                                errorMessage={errors.tuitionAmount && touched.tuitionAmount ? errors.tuitionAmount : undefined}
                                                required
                                            />
                                        </Stack>
                                    </Stack>
                                    <Separator />
                                    <DialogFooter>
                                        <PrimaryButton
                                            type="submit"
                                            text="Save"
                                            iconProps={{ iconName: 'Add' }}
                                            styles={{ rootHovered: { backgroundColor: '#0e4066' }, root: { marginRight: '8px' } }} />
                                        <DefaultButton
                                            onClick={this.dismissDialog}
                                            text="Cancel"
                                            iconProps={{ iconName: 'Cancel' }} />
                                    </DialogFooter>
                                </Form>
                            )}
                        </Formik>
                    ) : (<Spinner label="Getting tuition details" />)
                }

            </Dialog>
        );

    }

    private dismissDialog = () => {
        this.dismissMessage();
        this.props.onDismiss();
    }

    private onSubmit = (values: Student) => {
        if (values.id) {
            this.update(values);
        } else {
            this.create(values);
        }
    }

    private create = (values: Student) => {
        this.setProcessingStatus(true);
        axios({
            url: `${ENROLLMENTS_API_URL}/students`,
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(values)
        })
            .then(handleHttpErrors)
            .then(res => res.data)
            .then(student => {
                this.setProcessingStatus(false);
                this.props.onDismiss();
                this.props.onCreateSuccess(student);
            })
            .catch(error => {
                console.log(JSON.stringify(error));
                this.setState({
                    errorMessage: this.getMessage(error.message),
                    processing: false
                });
            });
    }

    private update = (student: Student) => {
        this.setProcessingStatus(true);
        axios({
            url: `${ENROLLMENTS_API_URL}/students/${student.id}`,
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(student)
        })
            .then(handleHttpErrors)
            .then(res => res.data)
            .then(student => {
                this.setProcessingStatus(false);
                this.props.onDismiss();
                this.props.onEditSuccess(student);
            })
            .catch(error => {
                console.log(JSON.stringify(error));
                this.setState({
                    errorMessage: this.getMessage(error.message),
                    processing: false
                });
            });
    }

    private getTuition = (studentId: number) => {
        this.setState({gettingTuition: true});
        axios({
            url: `${ENROLLMENTS_API_URL}/students/${studentId}/tuition`,
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        })
            .then(handleHttpErrors)
            .then(res => res.data)
            .then(tuition => this.setState({tuition: tuition, gettingTuition: false}))
            .catch(error => {
                console.log(JSON.stringify(error));
                this.setState({
                    gettingTuition: false,
                    errorMessage: this.getMessage(error.message)
                });
            });
    }

    private setProcessingStatus = (processing: boolean) => {
        this.setState({processing: processing});
    }

    private getMessage = (message: string) => {
        return (
            <MessageBar
                messageBarType={MessageBarType.error}
                isMultiline={false}
                onDismiss={this.dismissMessage}>
                {message}
            </MessageBar>
        );
    }

    private dismissMessage = () => {
        this.setState({ errorMessage: undefined });
    }
}