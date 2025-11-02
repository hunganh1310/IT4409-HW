import React from 'react';

const Error = ({ isError }) => {
    return (
        <div>
            {isError && <span>Không tìm thấy kết quả</span>}
        </div>
    );
};

export default Error;