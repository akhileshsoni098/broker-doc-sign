export const useApiFetch = () => {

  const config =
    useRuntimeConfig()

  const BASE =
    config.public.appUrl || ""

  async function apiFetch<T = any>(
    url: string,
    opts: RequestInit = {},
  ): Promise<T> {

    /*
    |------------------------------------------------------------
    | Get Token From LocalStorage
    |------------------------------------------------------------
    */

    const token =
      process.client
        ? localStorage.getItem("token")
        : ""

    /*
    |------------------------------------------------------------
    | Headers
    |------------------------------------------------------------
    */

    const headers:
      Record<string, string> = {

      ...(
        opts.headers as
        Record<string, string>
      || {}),

    }

    /*
    |------------------------------------------------------------
    | Content Type
    |------------------------------------------------------------
    */

    if (
      !(opts.body instanceof FormData)
    ) {

      headers["Content-Type"] =
        "application/json"

    }

    /*
    |------------------------------------------------------------
    | Authorization
    |------------------------------------------------------------
    */

    if (token) {

      headers["Authorization"] =
        `Bearer ${token}`

    }

    console.log(
      "TOKEN:",
      token
    )

    console.log(
      "HEADERS:",
      headers
    )

    /*
    |------------------------------------------------------------
    | Request
    |------------------------------------------------------------
    */

    const res =
      await fetch(
        `${BASE}${url}`,
        {
          ...opts,
          headers,
        }
      )

    /*
    |------------------------------------------------------------
    | Response
    |------------------------------------------------------------
    */

    const data =
      await res.json()

    if (!res.ok) {

      throw new Error(

        data?.statusMessage ||

        data?.message ||

        "Request failed"

      )
    }

    return data as T
  }

  return {

    apiFetch,

  }

}