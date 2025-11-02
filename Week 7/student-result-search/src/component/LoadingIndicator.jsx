import React from 'react';

const LoadingIndicator = ({isLoading}) => {
    return (
        <div>
            {isLoading && <span>Đang tải...</span>}
        </div>
    );
};

export default LoadingIndicator;

