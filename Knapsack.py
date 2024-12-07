import random

class ShipmentAllocator:
    def __init__(self, shipments=None, planes=None):
        # Initialize shipments and planes lists if not provided
        self.shipments = shipments or []
        self.planes = planes or []

    # Fitness function to evaluate the quality of a solution
    def fitness(self, allocation):
        total_value = 0
        plane_loads = {plane['name']: 0 for plane in self.planes}

        # Calculate total value by assigning shipments to planes
        for shipment, plane in allocation:
            if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']:
                plane_loads[plane['name']] += shipment['weight']
                total_value += shipment['cost']
            else:
                return float('inf')  # Invalid solution if the capacity is exceeded
        return total_value

    # Generate the initial solution by sorting shipments and planes
    def generate_initial_solution(self):
        sorted_planes = sorted(self.planes, key=lambda x: x['capacity'], reverse=True)
        sorted_shipments = sorted(self.shipments, key=lambda x: (x['cost'], x['weight']), reverse=True)

        allocation = []
        unallocated_shipments = []
        plane_loads = {plane['name']: 0 for plane in sorted_planes}

        # Assign shipments to planes
        for shipment in sorted_shipments:
            assigned = self.assign_shipment_to_plane(shipment, sorted_planes, plane_loads)
            if assigned:
                allocation.append(assigned)
            else:
                unallocated_shipments.append(shipment)  # Unassigned shipment

        # Attempt to allocate unassigned shipments
        for shipment in unallocated_shipments:
            assigned = self.assign_shipment_to_plane(shipment, sorted_planes, plane_loads)
            if assigned:
                allocation.append(assigned)

        return allocation, unallocated_shipments

    # Assign shipment to a suitable plane
    def assign_shipment_to_plane(self, shipment, sorted_planes, plane_loads):
        valid_planes = [plane for plane in sorted_planes if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']]
        if valid_planes:
            plane = valid_planes[0]
            plane_loads[plane['name']] += shipment['weight']
            return (shipment, plane)
        return None  # If no valid plane is found

    # Select the best solutions from the population
    def selection(self, population):
        fitness_scores = [(self.fitness(sol), sol) for sol in population]
        fitness_scores.sort(key=lambda x: x[0])  # Sort by fitness
        return [sol for _, sol in fitness_scores[:len(population) // 2]]

    # Perform crossover between two solutions
    def crossover(self, parent1, parent2):
        if len(parent1) > 1 and len(parent2) > 1:
            point = random.randint(1, len(parent1) - 1)
            child = parent1[:point] + parent2[point:]
            return self.ensure_valid_allocation(child)
        return parent1  # Return first parent if one of them has only one shipment

    # Mutate a solution by randomly changing the assigned planes
    def mutate(self, solution, mutation_rate):
        plane_loads = {plane['name']: 0 for plane in self.planes}
        for shipment, plane in solution:
            plane_loads[plane['name']] += shipment['weight']

        # Apply mutation to some shipments based on mutation rate
        for i in range(len(solution)):
            if random.random() < mutation_rate:
                shipment, current_plane = solution[i]
                valid_planes = [plane for plane in self.planes if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']]
                if valid_planes:
                    new_plane = random.choice(valid_planes)
                    plane_loads[current_plane['name']] -= shipment['weight']
                    plane_loads[new_plane['name']] += shipment['weight']
                    solution[i] = (shipment, new_plane)
        return solution

    # Ensure the allocation is valid by checking the plane capacities
    def ensure_valid_allocation(self, allocation):
        plane_loads = {plane['name']: 0 for plane in self.planes}
        valid_allocation = []
        unallocated_shipments = []

        for shipment, plane in allocation:
            if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']:
                plane_loads[plane['name']] += shipment['weight']
                valid_allocation.append((shipment, plane))
            else:
                unallocated_shipments.append(shipment)

        return valid_allocation

    # Genetic algorithm to evolve the best solution
    def genetic_algorithm(self, pop_size, generations, mutation_rate):
        # Generate initial population
        population = [self.generate_initial_solution()[0] for _ in range(pop_size)]

        # Evolve the population for a number of generations
        for _ in range(generations):
            selected_population = self.selection(population)
            next_generation = selected_population[:]

            # Create offspring by crossover and mutation
            while len(next_generation) < pop_size:
                parent1, parent2 = random.sample(selected_population, 2)
                child = self.crossover(parent1, parent2)
                next_generation.append(self.mutate(child, mutation_rate))

            population = next_generation

        # Choose the best solution based on fitness
        best_solution = min(population, key=lambda x: self.fitness(x))
        allocation, unallocated_shipments = self.generate_initial_solution()
        print("Best Solution:", best_solution)
        print("Unallocated Shipments:", unallocated_shipments)

        return best_solution, unallocated_shipments
