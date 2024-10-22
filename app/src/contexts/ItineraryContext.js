import { createContext, useContext, useState } from 'react';

export const ItineraryContext = createContext();

export const ItineraryProvider = ({children}) => {
  const [itineraries, setItineraries] = useState(null);

  return <ItineraryContext.Provider value={{ itineraries, setItineraries }}>
    {children}
  </ItineraryContext.Provider>
}

export const useItineraries = () => useContext(ItineraryContext);