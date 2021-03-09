function toMillies(value) {
  if (!value) {
    return;
  }

  const isMillies = value.endsWith('ms');

  return parseFloat(value) * (isMillies ? 1 : 1000);
}

function isTime(value) {
  return /^-?(0?\.)?\d+m?s$/.test(value);
}

function parseSingleTransition(transition) {
  const [name, duration, timingFunctionOrDelay, delay] = transition.split(
    /\s+/
  );

  if (isTime(timingFunctionOrDelay)) {
    return {
      delay: toMillies(timingFunctionOrDelay),
      duration: toMillies(duration),
      name,
    };
  }

  return {
    delay: toMillies(delay),
    duration: toMillies(duration),
    name,
    timingFunction: timingFunctionOrDelay,
  };
}

module.exports = function parseCssTransition(transition) {
  return transition
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map(parseSingleTransition);
}
