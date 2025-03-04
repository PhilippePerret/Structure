defmodule SttWeb.AppController do
  use SttWeb, :controller

  alias Stt.State

  def save_state(conn, params) do
    retour = %{ok: true, error: nil}
    State.save(params["state"])
    conn
    |> json(retour)
    |> halt()
  end

end 