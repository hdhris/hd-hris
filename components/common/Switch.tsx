import React, { ReactElement, ReactNode } from "react";
import {boolean} from "zod";

interface CaseProps {
    of: boolean | string;
    children: ReactNode;
}

const Case = ({ of, children }: CaseProps): ReactElement | null => {
    return of ? <>{children}</> : null;
};

interface DefaultProps {
    children: ReactNode;
}

const Default = ({ children }: DefaultProps): ReactElement => <>{children}</>;

interface SwitchProps {
    expression: string;
    children: ReactNode;
}

const Switch = ({ expression, children }: SwitchProps): ReactElement | null => {
    let matchChild: ReactElement | null = null;
    let defaultChild: ReactElement | null = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            if (child.type === Case && child.props.of === expression) {
                matchChild = child;
            } else if (child.type === Default) {
                defaultChild = child;
            }
        }
    });

    return matchChild ?? defaultChild;
};

export { Case, Default, Switch };
