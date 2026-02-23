import React, { Suspense } from "react";
import Signup from "../components/Signup";

const SignupPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
};

export default SignupPage;
