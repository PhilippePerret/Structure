import Config

# Note we also include the path to a cache manifest
# containing the digested version of static files. This
# manifest is generated by the `mix assets.deploy` task,
# which you should run after static files are built and
# before starting your production server.

# ORIGINAL:
# config :structure, SttWeb.Endpoint, cache_static_manifest: "priv/static/cache_manifest.json"

config :structure, SttWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: false,
  debug_errors: true,
  secret_key_base: "Em3EgkyZfat93pkVE2M2aYwlR9GqD0LpXT4i2JYmPiELn2n09FS+0ZZwwEDYWwkO"



# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
