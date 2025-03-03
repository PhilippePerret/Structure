defmodule SttWeb.AppController do
  use SttWeb, :controller

  def save_state(conn, _params) do
    retour = %{ok: true, error: nil}
    conn
    |> json(retour)
    |> halt()
  end

end 