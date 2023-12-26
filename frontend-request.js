// import cookies from "js-cookie";

export const request = async (
  method = "GET",
  url,
  data,
  responseType = "json",
  abortController
) => {
  const options = {
    method,
    headers: {
      Accept: "application/json, text/plain, */*",
      "auth-token": localStorage.getItem("auth_token"),
      //   "auth-token": cookies.get("auth_token"),
    },
    credentials: "include",
  };

  if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  if (data && ["GET"].includes(method.toUpperCase())) {
    url = `${url}?${new URLSearchParams(data).toString()}`;
  }

  if (abortController) {
    // const controller = new AbortController();
    options.signal = abortController.signal;
    // abort = controller.abort;
  }

  let res = await fetch(url, options);

  if ([401, 402, 403].includes(res.status)) {
    // cookies.remove("auth_token");
    localStorage.removeItem("auth_token");
    location.href = "/";
    return;
  }

  let output;
  if (responseType === "binary") {
    output = await res.blob();
  }
  if (responseType === "json") {
    output = await res.json();
  }
  if (location.href.includes("localhost")) {
    await new Promise((r) => setTimeout(r, 1000));
  }
  return output;
};
