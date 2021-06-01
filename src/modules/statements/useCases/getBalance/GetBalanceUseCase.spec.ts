import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { v4 as uuidV4 } from "uuid";
import { GetBalanceError } from "./GetBalanceError";

let getBalanceUseCase: GetBalanceUseCase;
let statementRepository: IStatementsRepository;
let userRepository: IUsersRepository;

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      userRepository
    );
  });

  it("should be able to get the balance", async () => {
    const user = await userRepository.create({
      email: "test@test.com",
      password: "test1234",
      name: "Test",
    });

    const userId = user.id ? user.id : "-1";

    await statementRepository.create({
      amount: 12000,
      description: "salary",
      type: OperationType.DEPOSIT,
      user_id: userId,
    });

    await statementRepository.create({
      amount: 1500,
      description: "sells",
      type: OperationType.DEPOSIT,
      user_id: userId,
    });

    await statementRepository.create({
      amount: 2000,
      description: "rent",
      type: OperationType.WITHDRAW,
      user_id: userId,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: userId,
    });

    expect(balance.balance).toEqual(11500);
  });

  it("should not be able to get the balance when the user doesn't exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: uuidV4(),
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
