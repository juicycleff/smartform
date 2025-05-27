import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Loader2 } from 'lucide-react'

import type React from 'react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { AuthStrategy, type Field } from '../../core'
import { useLogger } from '../../logger'
import { useSmartForm } from '../index'

interface AuthFieldProps {
  field: Field
  path: string
}

const AuthField: React.FC<AuthFieldProps> = ({ field, path }) => {
  const log = useLogger()
  const { isFieldEnabled, isFieldRequired } = useSmartForm()
  const { control, setValue } = useFormContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const disabled = !isFieldEnabled(field)
  const required = isFieldRequired(field)

  // Determine the auth type from properties
  const authType =
    (field.properties?.authType as AuthStrategy) || AuthStrategy.OAuth2

  // Function to handle authentication
  const handleAuthenticate = async (authData: Record<string, string>) => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, you would call an authentication API
      // This is a placeholder implementation
      const response = await fetch(`/api/auth/${authType.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed with status ${response.status}`)
      }

      const data = (await response.json()) as any

      if (data.token) {
        setAuthToken(data.token)
        setValue(path, data.token)
      } else {
        throw new Error('No token received from authentication service')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      log.error('Authentication error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Render different auth forms based on the auth type
  const renderAuthForm = () => {
    switch (authType) {
      case AuthStrategy.OAuth2:
        return (
          <div className="sf-space-y-4">
            <p className="sf-text-gray-500 sf-text-sm">
              Click the button to authenticate using OAuth2:
            </p>
            <Button
              type="button"
              onClick={() => {
                // In a real implementation, this would open an OAuth popup
                // For now, we'll just simulate success
                handleAuthenticate({
                  grant_type: 'authorization_code',
                  code: 'simulated_code',
                })
              }}
              disabled={disabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="sf-mr-2 sf-h-4 sf-w-4 sf-animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Authenticate with OAuth2'
              )}
            </Button>
          </div>
        )

      case AuthStrategy.Basic:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <FormLabel htmlFor={`${path}-username`}>Username</FormLabel>
              <Input
                id={`${path}-username`}
                type="text"
                placeholder="Enter username"
                disabled={disabled || loading}
                onChange={() => setError(null)}
              />
            </div>

            <div className="grid gap-2">
              <FormLabel htmlFor={`${path}-password`}>Password</FormLabel>
              <Input
                id={`${path}-password`}
                type="password"
                placeholder="Enter password"
                disabled={disabled || loading}
                onChange={() => setError(null)}
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                const username =
                  (
                    document.getElementById(
                      `${path}-username`,
                    ) as HTMLInputElement
                  )?.value || ''
                const password =
                  (
                    document.getElementById(
                      `${path}-password`,
                    ) as HTMLInputElement
                  )?.value || ''

                if (!username || !password) {
                  setError('Username and password are required')
                  return
                }

                handleAuthenticate({ username, password })
              }}
              disabled={disabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        )

      case AuthStrategy.APIKey:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <FormLabel htmlFor={`${path}-apikey`}>API Key</FormLabel>
              <Input
                id={`${path}-apikey`}
                type="text"
                placeholder="Enter API key"
                disabled={disabled || loading}
                onChange={() => setError(null)}
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                const apiKey =
                  (
                    document.getElementById(
                      `${path}-apikey`,
                    ) as HTMLInputElement
                  )?.value || ''

                if (!apiKey) {
                  setError('API key is required')
                  return
                }

                handleAuthenticate({ apiKey })
              }}
              disabled={disabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate API Key'
              )}
            </Button>
          </div>
        )

      case AuthStrategy.JWT:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <FormLabel htmlFor={`${path}-jwt`}>JWT Token</FormLabel>
              <Input
                id={`${path}-jwt`}
                type="text"
                placeholder="Enter JWT token"
                disabled={disabled || loading}
                onChange={() => setError(null)}
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                const jwt =
                  (document.getElementById(`${path}-jwt`) as HTMLInputElement)
                    ?.value || ''

                if (!jwt) {
                  setError('JWT token is required')
                  return
                }

                handleAuthenticate({ jwt })
              }}
              disabled={disabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate JWT'
              )}
            </Button>
          </div>
        )

      case AuthStrategy.SAML:
        return (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Click the button to using SAML:
            </p>
            <Button
              type="button"
              onClick={() => {
                // In a real implementation, this would initiate SAML auth
                // For now, we'll just simulate success
                handleAuthenticate({ provider: 'simulated_saml_provider' })
              }}
              disabled={disabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Authenticate with SAML'
              )}
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-red-500">
            Unsupported authentication type: {authType}
          </div>
        )
    }
  }

  return (
    <FormField
      control={control}
      name={path}
      render={({ field: _formField }) => (
        <FormItem>
          <FormLabel
            className={
              required
                ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                : ''
            }
          >
            {field.label}
          </FormLabel>

          <FormControl>
            <Card>
              <CardHeader>
                <CardTitle>{field.label}</CardTitle>
                <CardDescription>
                  {field.helpText || `Authenticate using ${authType}`}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {authToken ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-600 text-sm">
                      Authentication successful!
                    </p>
                    <Input value={authToken} readOnly disabled />
                  </div>
                ) : (
                  renderAuthForm()
                )}
                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
              </CardContent>

              {authToken && (
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAuthToken(null)
                      setValue(path, null)
                    }}
                  >
                    Clear Authentication
                  </Button>
                </CardFooter>
              )}
            </Card>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default AuthField
