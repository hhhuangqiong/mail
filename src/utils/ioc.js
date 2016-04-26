import Bottle from 'bottlejs';

/**
 * Retrieve the container with the specified name
 *
 * NB: only able to retrieve bottle instantiated without `new`
 *
 * @param {String} name The name of the container
 * @return {Bottle} container
 */
export function fetchContainerInstance(name) {
  return Bottle.pop(name);
}

/**
 * Retrieve the dependency registered with that container with the specified name
 *
 * @param {String} name The name of the container instantiated
 * @param {String} depIdentifier Dependency identifier
 *
 * @return {*|null} The registered dependency
 */
export function fetchDep(name, depIdentifer) {
  const ioc = fetchContainerInstance(name);
  if (ioc) {
    // TODO prevent the 'identifier.' case
    return depIdentifer.split('.').reduce((result, key) => result[key], ioc.container);
  }
  return null;
}
