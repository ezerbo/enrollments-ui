import React from "react";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import {Pivot, PivotItem} from "@fluentui/react";
import {Students} from "../Students/Students";
import {Courses} from "../Courses/Courses";

interface HomeState {
    studentCount: number
    courseCount: number
}

export class Home extends React.Component<{}, HomeState> {

    constructor(props: {}) {
        super(props);
        this.state = { studentCount: 0, courseCount: 0 };
    }

    render() {
        const {studentCount, courseCount} = this.state;
        return (
            <div>
                <Header />
                <Pivot aria-label="Count and Icon Pivot Example">
                    <PivotItem headerText="Students" itemCount={studentCount} itemIcon="People">
                        <Students onCountChange={this.onStudentCountChange} />
                    </PivotItem>
                    <PivotItem headerText="Courses" itemCount={courseCount} itemIcon="FolderList">
                       <Courses />
                    </PivotItem>
                </Pivot>
                <Footer />
            </div>
        );
    }

    private onStudentCountChange = (count: number) => {
        this.setState({studentCount: count});
    }

    private onCourseCountChange = (count: number) => {
        this.setState({courseCount: count});
    }

}