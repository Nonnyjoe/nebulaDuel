import { FC } from "react";

type MaxWrapperTypes = {
    children: React.ReactNode;
    className?: string;
};

const MaxWrapper: FC<MaxWrapperTypes> = ({ children, className }) => {
    return (
        <div className={`w-full mx-auto max-w-[1368px] ${className}`}>
            {children}
        </div>
    );
};

export default MaxWrapper;
