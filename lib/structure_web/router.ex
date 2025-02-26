defmodule SttWeb.Router do
  use SttWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {SttWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/structure", SttWeb do
    pipe_through :browser
    post "/load", StructureController, :load
    post "/save", StructureController, :save
  end

  scope "/", SttWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  # Other scopes may use custom stacks.
  # scope "/api", SttWeb do
  #   pipe_through :api
  # end
end
