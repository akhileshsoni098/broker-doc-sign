import { ApiClient, EnvelopesApi } from "docusign-esign"
import * as fs from "fs"
import * as path from "path"

let dsApiClient: ApiClient | null = null

function getDsApi(): EnvelopesApi {
  const config = useRuntimeConfig()

  if (!dsApiClient) {
    dsApiClient = new ApiClient({
      basePath: config.docusignBasePath,
    })
  }

  const privateKey = config.docusignPrivateKey

  const jwtLifeSec = 3600
  const scopes = ["signature", "impersonation"]

  try {
    const token = dsApiClient.requestJWTUserToken(
      config.docusignClientId!,
      config.docusignUserId!,
      scopes,
      privateKey!,
      jwtLifeSec
    )

    dsApiClient.setUserToken(token.body.access_token)
  } catch (e) {
    console.error("DocuSign JWT auth error:", e)
  }

  return new EnvelopesApi(dsApiClient)
}

export const dsApi = {
  createEnvelope(accountId: string, opts: any) {
    const api = getDsApi()
    return api.createEnvelope(accountId, opts)
  },
}

export function makeEnvelope(documentUrl: string, documentName: string, returnUrl: string) {
  return {
    emailSubject: "Please sign your document",
    documents: [
      {
        documentBase64: "",
        name: documentName || "Document",
        fileExtension: "pdf",
        documentId: "1",
      },
    ],
    recipients: {
      signers: [
        {
          email: "signer@example.com",
          name: "Signer",
          recipientId: "1",
          routingOrder: "1",
          tabs: {
            signHereTabs: [
              {
                anchorString: "**signature_here**",
                anchorUnits: "pixels",
                anchorXOffset: "20",
                anchorYOffset: "10",
              },
            ],
          },
        },
      ],
    },
    status: "sent",
    eventNotification: {
      url: `${useRuntimeConfig().public.appUrl}/api/public/docusign/webhook`,
      loggingEnabled: "true",
      envelopeEvents: [
        { envelopeEventStatusCode: "completed" },
      ],
    },
  }
}

export async function downloadEnvelopeDocument(envelopeId: string, documentId: string): Promise<Buffer> {
  const api = getDsApi()
  const config = useRuntimeConfig()
  const result = await api.getDocument(config.docusignAccountId!, documentId, envelopeId)
  return result as unknown as Buffer
}
