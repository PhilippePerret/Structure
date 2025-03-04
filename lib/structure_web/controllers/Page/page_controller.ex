defmodule SttWeb.PageController do
  use SttWeb, :controller

  alias Stt.State

  def home(conn, _params) do
    render(conn, :home, path: State.get_last_structure())
  end
end
