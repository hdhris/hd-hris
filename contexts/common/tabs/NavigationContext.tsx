import { createContext } from 'react';

export const NavEndContext = createContext<React.Dispatch<React.SetStateAction<React.JSX.Element>>>(() => {});
