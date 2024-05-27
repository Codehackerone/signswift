import React, { createContext, useState } from "react";

type appChildren = {
  children: React.ReactNode;
};
type appValue = {
  loggedin: boolean;
  setloggedin: React.Dispatch<React.SetStateAction<boolean>>;
};
export const loginContext = createContext<appValue>({
  loggedin: false,
  setloggedin: () => {},
});
export default function LoginProvider({ children }: appChildren) {
  const [loggedin, setloggedin] = useState(
    localStorage.getItem("currentuser") === null ? false : true,
  );
  // useEffect(() => {
  //   console.log(loggedin);
  // }, [loggedin]);
  return (
    <loginContext.Provider value={{ loggedin, setloggedin }}>
      {children}
    </loginContext.Provider>
  );
}
