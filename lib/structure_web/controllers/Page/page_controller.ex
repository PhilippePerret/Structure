defmodule SttWeb.PageController do
  use SttWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
