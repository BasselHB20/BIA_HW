import numpy as np
import math
import random

class BestRoute:

    def __init__(self, cities, central_city):
        self.cities = cities
        self.central_city = central_city
       

    # Function to calculate distance using Haversine formula
    def haversine_distance(self, city1, city2):
        lat1, lon1 = self.cities[city1]
        lat2, lon2 = self.cities[city2]

        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        # Haversine formula
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        R = 6371  # The radius of the Earth in kilometers
        return R * c

    # Function to calculate total distance for a given route
    def total_distance(self, route):
        distance = 0
        for i in range(len(route)):
            distance += self.haversine_distance(route[i], route[(i + 1) % len(route)])
        return distance

    # Create initial population of routes
    def create_population(self, size):
        population_init = []
        all_cities = list(self.cities.keys())
        if self.central_city in all_cities:
            all_cities.remove(self.central_city)
        else:
            raise ValueError(f"The central city '{self.central_city}' is not in the list of cities.")
        if len(all_cities) == 0:
            raise ValueError("No cities available for sampling after removing the central city.")
        #all_cities.remove(self.central_city)  # Remove the central city from the random list
        for _ in range(size):
            route = [self.central_city] + random.sample(all_cities, len(all_cities))
            population_init.append(route)
        return population_init

    # Calculate fitness of each route (total distance)
    def evaluate_fitness(self, population):
        return [self.total_distance(route) for route in population]

    # Select the best routes based on fitness
    def selection(self, population, fitness, num_best):
        best_indices = np.argsort(fitness)[:num_best]
        return [population[i] for i in best_indices]

    # Generate a child route using crossover
    def crossover(self, route1, route2):
        if len(route1) < 1 or len(route2) < 1:
            raise ValueError("Routes must contain at least 2 cities to perform crossover.")
        try:
            start, end = sorted(random.sample(range(len(route1)), 2))
        except ValueError:
            raise ValueError("Sample larger than population or is negative. Ensure routes have at least 2 elements.")
        # start, end = sorted(random.sample(range(len(route1)), 2))
        child = [None] * len(route1)
        child[start:end] = route1[start:end]
        pointer = 0
        for city in route2:
            if city not in child:
                while child[pointer] is not None:
                    pointer += 1
                child[pointer] = city
        return child

    # Apply mutation to a route
    def mutate(self, route, mutation_rate):
        if random.random() < mutation_rate:
            i, j = random.sample(range(1, len(route)), 2)  # Switch cities except the central city
            route[i], route[j] = route[j], route[i]

    # Genetic Algorithm to find the best route
    def genetic_algorithm(self, population_size, generations, mutation_rate):
        population = self.create_population(population_size)
        best_route = None
        best_distance = float('inf')

        for generation in range(generations):
            fitness = self.evaluate_fitness(population)
            best_gen_route = population[np.argmin(fitness)]
            best_gen_distance = min(fitness)

            if best_gen_distance < best_distance:
                best_route = best_gen_route
                best_distance = best_gen_distance

            new_population = self.selection(population, fitness, population_size // 2)
            while len(new_population) < population_size:
                parent1, parent2 = random.sample(new_population, 2)
                child = self.crossover(parent1, parent2)
                self.mutate(child, mutation_rate)
                new_population.append(child)

            population = new_population

        return best_route, best_distance
