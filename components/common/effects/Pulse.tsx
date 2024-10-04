import React from 'react';

function Pulse() {
    return (
        <span className="absolute -top-3 -right-2 h-3 w-3">
          <span
              className="animate-ping absolute -right-1 -top-0 inline-flex h-5 w-5 rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
        </span>
    );
}

export default Pulse;