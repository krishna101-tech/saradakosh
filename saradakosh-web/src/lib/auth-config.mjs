// Server-owned origin policy. Do not derive trusted origins from request headers.
export function authConfiguration(environment = process.env.AUTH_ENVIRONMENT) {
  if (environment !== "development" && environment !== "production") {
    throw new Error("AUTH_ENVIRONMENT must explicitly select development or production.");
  }

  const origins = environment === "production"
    ? ["https://www.saradakosh.org", "https://blog.saradakosh.org"]
    : ["http://localhost:3100", "http://localhost:3101"];

  return {
    authorizedParties: origins,
    mainOrigin: origins[0],
    signInUrl: `${origins[0]}/sign-in`,
    signUpUrl: `${origins[0]}/sign-up`,
  };
}
