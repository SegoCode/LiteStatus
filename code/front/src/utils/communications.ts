interface Communication {
  timestamp: Date;
  message: string;
  type: 'investigating' | 'resolved';
}

interface Service {
  name: string;
  pings: {
    timestamp: Date;
    status: 'up' | 'down';
    responseTime: number;
  }[];
}

export function generateCommunications(services: Service[]): Communication[] {
  const communications: Communication[] = [];
  const downServices = services.filter(
    service => service.pings[service.pings.length - 1].status === 'down'
  );

  if (downServices.length > 0) {
    const affectedServices = downServices.map(service => service.name).join(', ');
    const latestDownTimestamp = downServices.reduce((latest, service) => {
      const serviceLatest = service.pings[service.pings.length - 1].timestamp;
      return latest > serviceLatest ? latest : serviceLatest;
    }, new Date(0));

    communications.push({
      timestamp: latestDownTimestamp,
      message: `We are investigating reports of issues with: ${affectedServices}`,
      type: 'investigating'
    });
  }

  // Find the latest successful ping across all services
  const latestSuccessfulPing = services.reduce((latest, service) => {
    const successfulPings = service.pings.filter(ping => ping.status === 'up');
    if (successfulPings.length === 0) return latest;
    
    const serviceLatest = successfulPings[successfulPings.length - 1].timestamp;
    return latest > serviceLatest ? latest : serviceLatest;
  }, new Date(0));

  if (downServices.length === 0) {
    communications.push({
      timestamp: latestSuccessfulPing,
      message: 'All systems are operating normally',
      type: 'resolved'
    });
  }

  return communications;
}