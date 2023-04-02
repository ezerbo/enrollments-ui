import React from "react";

export class Footer extends React.Component {

    render() {
        return (
            <div style={{ clear: 'left' }}>
                © {new Date().getFullYear()} Datadog Demo
            </div>
        );
    }
}