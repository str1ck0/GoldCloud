Rails.application.routes.draw do
  root to: "pages#home"

  devise_for :users

  resources :items do
    collection do
      get 'search'
    end
  end

  resources :products, only: %i[new create edit update destroy]
  resources :packages, only: %i[new create edit update destroy]

  resources :order_items, only: %i[create update destroy]

  get 'cart', to: 'orders#cart'
  get 'checkout', to: 'orders#checkout'
  get 'account', to: 'pages#account', as: 'account'

  resources :orders do
    member do
      patch 'confirm_order'
      get 'order_confirmation'
    end
    collection do
      get 'pending_orders'
    end
  end

  get 'orders', to: 'orders#index'

  resources :chats, only: %i[index show create destroy] do
    resources :messages, only: [:create]
  end

  resources :ratings, only: [:create, :update, :destroy]
end
