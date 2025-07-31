import { useAccount as useWagmiAccount } from 'wagmi'

export const useAccount = () => {
  const { address } = useWagmiAccount()
  return address
}
