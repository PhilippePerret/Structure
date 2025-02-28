defmodule SttWeb.Layouts do
  @moduledoc """
  This module holds different layouts used by your application.

  See the `layouts` directory for all templates available.
  The "root" layout is a skeleton rendered as part of the
  application router. The "app" layout is set as the default
  layout on both `use SttWeb, :controller` and
  `use SttWeb, :live_view`.
  """
  use SttWeb, :html

  embed_templates "layouts/*"

  def form_element(assigns)

  def listing_elements(assigns)
  
end
