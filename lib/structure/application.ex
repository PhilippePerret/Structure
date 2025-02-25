defmodule Stt.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SttWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:structure, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Stt.PubSub},
      # Start a worker by calling: Stt.Worker.start_link(arg)
      # {Stt.Worker, arg},
      # Start to serve requests, typically the last entry
      SttWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Stt.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SttWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
