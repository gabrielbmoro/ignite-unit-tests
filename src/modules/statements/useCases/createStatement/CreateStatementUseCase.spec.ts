import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement, OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let userRepository: IUsersRepository;
let statementRepository: IStatementsRepository;

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
  });

  it("should be able to create a deposit", async () => {
    const user = await userRepository.create({
      email: "test@test.com",
      password: "test1234",
      name: "Test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id ? user.id : "-1",
      amount: 12000,
      description: "salary",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should be able to create a withdraw", async () => {
    const user = await userRepository.create({
      email: "test@test.com",
      password: "test1234",
      name: "Test",
    });

    await createStatementUseCase.execute({
      user_id: user.id ? user.id : "-1",
      amount: 12000,
      description: "salary",
      type: OperationType.DEPOSIT,
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id ? user.id : "-1",
      amount: 2000,
      description: "rent",
      type: OperationType.WITHDRAW,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a withdraw without funds", async () => {
    expect(async () => {
      const user = await userRepository.create({
        email: "test@test.com",
        password: "test1234",
        name: "Test",
      });

      await createStatementUseCase.execute({
        user_id: user.id ? user.id : "-1",
        amount: 2000,
        description: "rent",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError);
  });
});
