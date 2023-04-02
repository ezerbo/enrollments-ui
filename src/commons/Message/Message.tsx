import React from "react";
import {MessageBar, MessageBarType} from "@fluentui/react";

interface MessageProps {
    message: string
    type: MessageBarType
    onMessageDismiss?: () => void
}

export class Message extends React.Component<MessageProps, any> {

    render() {
        const {message, type, onMessageDismiss} = this.props;
        return (
            <MessageBar
                messageBarType={type}
                isMultiline={false}
                onDismiss={onMessageDismiss}>
                {message}
            </MessageBar>
        );
    }
}