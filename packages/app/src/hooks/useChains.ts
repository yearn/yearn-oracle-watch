import { chainsContext } from '@/context/ChainsProvider'
import { useContext } from 'react'

export const useChains = () => useContext(chainsContext)
