import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import LoginPage from '../src/app/login/page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

test('LoginPage renders correctly', async () => {
  const ui = await LoginPage({ searchParams: Promise.resolve({}) })
  render(ui)
  expect(screen.getByText('SmartClose TC')).toBeInTheDocument()
  expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
})

test('LoginPage displays error message on invalid credentials', async () => {
  const ui = await LoginPage({ searchParams: Promise.resolve({ error: 'invalid_credentials' }) })
  render(ui)
  expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
})
