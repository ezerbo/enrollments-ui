import React from "react";
import {DatePicker, DayOfWeek} from "@fluentui/react";

export const onFormatDate = (dateInMillis: any): string => {
    let date = new Date(dateInMillis);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// @ts-ignore
export const CustomDatePicker = ({ field, form, ...props }) => (
    <DatePicker
        {...field}
        {...props}
        value={field.value}
        firstDayOfWeek={DayOfWeek.Monday}
      //  strings={datePickerStrings}
        isRequired={true}
        formatDate={onFormatDate}
        onSelectDate={date => form.setFieldValue(field.name, date)}
    />
);