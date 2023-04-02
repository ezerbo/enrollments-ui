import React, { Component } from "react";
import {DefaultButton, mergeStyleSets, PrimaryButton} from "@fluentui/react";

const classNames = mergeStyleSets({
    buttonWithRightMargin: {
        marginRight: '5px'
    },
    deleteButton: {
        backgroundColor: '#a80000',
        color: '#ffffff'
    }
})

export interface TableFooterProps {
    selection?: any;
    hideCrudButtons?: boolean;
    disabledUntilSelection: boolean;
    disableAdd?: boolean;
    disableEdit?: boolean;
    onAddClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export class TableControl extends Component<TableFooterProps, {}> {

    public render() {
        let { hideCrudButtons, disableAdd, disableEdit } = this.props;
        return (
            <div>
                {
                    !hideCrudButtons && (
                        <div style={{ float: 'left' }}>
                            {
                                !disableAdd && (
                                    <PrimaryButton
                                        iconProps={{ iconName: 'Add' }}
                                        className={classNames.buttonWithRightMargin}
                                        onClick={this.props.onAddClick}
                                    />
                                )
                            }
                            {
                                !disableEdit && (
                                    <PrimaryButton
                                        iconProps={{ iconName: 'Edit' }}
                                        className={classNames.buttonWithRightMargin}
                                        disabled={this.props.disabledUntilSelection}
                                        onClick={this.props.onEditClick}
                                    />
                                )
                            }
                            <DefaultButton
                                iconProps={{ iconName: 'Delete' }}
                                className={classNames.deleteButton}
                                disabled={this.props.disabledUntilSelection}
                                onClick={this.props.onDeleteClick}
                            />
                        </div>
                    )
                }
                <div style={{ clear: 'left' }}></div>
            </div>
        );
    }
}