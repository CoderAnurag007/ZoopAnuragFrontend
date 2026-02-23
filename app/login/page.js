import React, { Suspense } from "react";
import Login from "../components/Login";

const login = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    </div>
  );
};

export default login;
